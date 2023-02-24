import React from "react";
import { Flex } from "@chakra-ui/react";
import AuthButtons from "@/src/components/navbar/rightContent/AuthButtons";
import AuthModal from "@/src/components/modal/auth";
import { User } from "firebase/auth";
import ActionIcons from "./Icons";
import UserMenu from "./UserMenu";

type RightContentProps = {
    user?: User | null;
};

const RightContent: React.FC<RightContentProps> = ({user}) => {
    return (
        <>
            <AuthModal />
            <Flex justify="center" align="center">
                {user ? <ActionIcons /> : <AuthButtons />}
                <UserMenu user={user} />
            </Flex>
        </>
    );
};

export default RightContent;
