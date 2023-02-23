import { useRouter } from "next/router";
import { useEffect } from "react";
import { FaReddit } from "react-icons/fa";
import { useRecoilState, useRecoilValue } from "recoil"
import { CommunityState } from "../atoms/communitiesAtom";
import { defaultMenuItem, DirectoryMenuItem, DirectoryMenuState } from "../atoms/directoryMenuAtom";

const useDirectory = () => {
    const [directoryState, setDirectoryState] = useRecoilState(DirectoryMenuState);
    const router = useRouter();

    const communityStateValue = useRecoilValue(CommunityState);

    const onSelectMenuItem = (menuItem: DirectoryMenuItem) => {
        setDirectoryState(prev => ({
            ...prev,
            selectedMenuItem: menuItem,
        }));

        router?.push(menuItem.link);
        if (directoryState.isOpen) {
            toggleMenuOpen();
        }
    };

    const toggleMenuOpen = () => {
        setDirectoryState(prev => ({
            ...prev,
            isOpen: !directoryState.isOpen,
        }));
    };

    useEffect(() => {
        const {community} = router.query;

        const existingCommunity = communityStateValue.currentCommunity;

        if (existingCommunity.id) {
            setDirectoryState(prev => ({
                ...prev,
                selectedMenuItem: {
                    displayText: `r/${existingCommunity.id}`,
                    link: `r/${existingCommunity.id}`,
                    icon: FaReddit,
                    iconColor: "blue.500",
                    imageURL: existingCommunity.imageURL,
                },
            }));
            return;
        }
        setDirectoryState(prev => ({
            ...prev,
            selectedMenuItem: defaultMenuItem,
        }));
    }, [communityStateValue.currentCommunity]);

    return {directoryState, onSelectMenuItem, toggleMenuOpen};
};

export default useDirectory;