import { Flex, Icon } from "@chakra-ui/react";
import { BsLink45Deg, BsMic } from "react-icons/bs";
import { IoDocumentText, IoImageOutline } from "react-icons/io5";
import { BiPoll } from "react-icons/bi"
import TabItem from "./TabItem";
import React, { useRef, useState } from "react";
import TextInputs from "./TextInputs";
import ImageUpload from "./ImageUpload";
import { postState } from "@/src/atoms/postsAtom";
import { User } from "firebase/auth";
import { useRouter } from "next/router";
import { addDoc, collection, serverTimestamp, updateDoc } from "firebase/firestore";
import { firestore, storage } from "@/src/firebase/clientApp";
import { ref, uploadString, getDownloadURL } from "@firebase/storage";
import { useSetRecoilState } from "recoil";

const formTabs = [
    {
        title: "Post",
        icon: IoDocumentText,
    },
    {
        title: "Images & Video",
        icon: IoImageOutline,
    },
    {
        title: "Link",
        icon: BsLink45Deg,
    },
    {
        title: "Poll",
        icon: BiPoll,
    },
    {
        title: "Talk",
        icon: BsMic,
    },
];

export type TabItem = {
    title: string;
    icon: typeof Icon.arguments;
};

type NewPostFormProps = {
    communityId: string;
    communityImageURL?: string;
    user: User;
};

const NewPostForm: React.FC<NewPostFormProps> = ({communityId, user, communityImageURL}) => {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState(formTabs[0].title);
    const [textInputs, setTextInputs] = useState({
        title: "",
        body: ""
    });
    const [selectedFile, setSelectedFile] = useState<string>();
    const selectFileRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const setPostItems = useSetRecoilState(postState);

    const handleCreatePost = async () => {
        setLoading(true);
        const {title, body} = textInputs;
        try {
            // STORE THE POST IN DB
            const postDocRef = await addDoc(collection(firestore, "posts"), {
                communityId,
                communityImageURL: communityImageURL || "",
                creatorId: user.uid,
                userDisplayText: user.email!.split("@")[0],
                title,
                body,
                numberOfComments: 0,
                voteStatus: 0,
                createdAt: serverTimestamp(),
                editedAt: serverTimestamp(),
            });

            // CHECK FOR SELECTED FILE
            if (selectedFile) {
                // STORE IN STORAGE => getDownloadURL (return imageURL)
                const imageRef = ref(storage, `posts/${postDocRef.id}/image`);
                await uploadString(imageRef, selectedFile, "data_url");
                const downloadURL = await getDownloadURL(imageRef);

                // UDPATE POST DOC BY ADDING imageURL
                await updateDoc(postDocRef, {
                    imageURL: downloadURL,
                });
            }
            setPostItems((prev) => ({
                ...prev,
                postUpdateRequired: true
            }));
            router.back();
        }
        catch (error: any) {
            console.log("handleCreatePost error", error.message);
            setError("Error creating post");
        }
        setLoading(false);
    };

    const onSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const reader = new FileReader();
        if (event.target.files?.[0]) {
            reader.readAsDataURL(event.target.files[0]);
        }

        reader.onload = (readerEvent) => {
            if (readerEvent.target?.result) {
                setSelectedFile(readerEvent.target?.result as string);
            }
        };
    };

    const onTextChange = ({target: {name, value}, }: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTextInputs((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    
    return (
        <Flex direction="column" bg="white" borderRadius={4} mt={2}>
          <Flex width="100%">
            {formTabs.map((item, index) => (
              <TabItem
                key={index}
                item={item}
                selected={item.title === selectedTab}
                setSelectedTab={setSelectedTab}
              />
            ))}
          </Flex>
          <Flex p={4}>
            {selectedTab === "Post" && (
              <TextInputs
                textInputs={textInputs}
                onChange={onTextChange}
                handleCreatePost={handleCreatePost}
                loading={loading}
              />
            )}
            {selectedTab === "Images & Video" && (
              <ImageUpload
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                setSelectedTab={setSelectedTab}
                selectFileRef={selectFileRef}
                onSelectImage={onSelectImage}
              />
            )}
          </Flex>
        </Flex>
      );
};

export default NewPostForm;