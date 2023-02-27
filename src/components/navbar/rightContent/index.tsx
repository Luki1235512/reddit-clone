import React from "react";
import { Flex } from "@chakra-ui/react";
import AuthButtons from "@/src/components/navbar/rightContent/AuthButtons";
import AuthModal from "@/src/components/modal/auth";
import { User } from "firebase/auth";
import MenuWrapper from "./ProfileMenu/MenuWrapper";
import Icons from "./Icons";

type RightContentProps = {
    user: User;
};

const RightContent: React.FC<RightContentProps> = ({user}) => {
    return (
        <>
            <AuthModal />
            <Flex justifyContent="space-between" alignItems="center">
                {user ? <Icons /> : <AuthButtons />}
                <MenuWrapper />
            </Flex>
        </>
    );
};

export default RightContent;
