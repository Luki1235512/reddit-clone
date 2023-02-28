import React from "react";
import { Flex, Image } from "@chakra-ui/react";
import SearchInput from "@/src/components/navbar/SearchInput";
import RightContent from "@/src/components/navbar/rightContent";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/src/firebase/clientApp";
import Directory from "./directory";
import useDirectory from "@/src/hooks/useDirectory";
import { defaultMenuItem } from "@/src/atoms/directoryMenuAtom";
import { User } from "firebase/auth";

const Navbar: React.FC = () => {
    const [user] = useAuthState(auth);

    const {onSelectMenuItem} = useDirectory();

    return (
        <Flex 
            bg="white" 
            height="44px" 
            padding="6px 12px" 
            justifyContent={{md: "space-between"}}>
            <Flex 
                align="center" 
                width={{base: "40px", md: "auto"}} 
                mr={{base: 0, md: 2}}
                cursor="pointer"
                onClick={() => onSelectMenuItem(defaultMenuItem)}
            >
                <Image src="/images/redditFace.svg" height="30px" />
                <Image 
                    src="/images/redditText.svg" 
                    height="46px" 
                    display={{ base: "none", md: "unset" }} 
                />
            </Flex>
            {user && <Directory />}
            <SearchInput user={user as User} />
            <RightContent user={user as User} />
        </Flex>
    );
};

export default Navbar;
