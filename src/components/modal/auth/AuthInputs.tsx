import React from "react";
import {Flex} from "@chakra-ui/react";
import {useRecoilValue} from "recoil";
import {authModalState} from "@/src/atoms/authModalAtoms";
import Login from "@/src/components/modal/auth/Login";
import SignUp from "@/src/components/modal/auth/SignUp";

type AuthInputsProps = {

};

const AuthInputs: React.FC<AuthInputsProps> = () => {
    const modalState = useRecoilValue(authModalState);

    return (
        <Flex direction="column" align="center" width="100%" mt={4}>
            {modalState.view === "login" && <Login />}
            {modalState.view === "signup" && <SignUp />}
        </Flex>
    );
};

export default AuthInputs;
