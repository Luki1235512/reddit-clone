import React, { useState } from "react";
import { Button, Flex, Text } from "@chakra-ui/react";
import { useSignInWithEmailAndPassword} from "react-firebase-hooks/auth";
import { auth } from "@/src/firebase/clientApp";
import { FIREBASE_ERRORS } from "@/src/firebase/errors";
import { ModalView } from "@/src/atoms/authModalAtom";
import InputItem from "../../layout/InputItem";

type LoginProps = {
    toggleView: (view: ModalView) => void;
};

const Login: React.FC<LoginProps> = ({toggleView}) => {
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [formError, setFormError] = useState("");
    const [signInWithEmailAndPassword, user, loading, authError] = useSignInWithEmailAndPassword(auth);

    // FIREBASE LOGIC
    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (formError) setFormError("");
        if (!form.email.includes("@")) {
            return setFormError("Please enter a valid email");
        }
        signInWithEmailAndPassword(form.email, form.password);
    };

    const onChange = ({target: {name, value},}: React.ChangeEvent<HTMLInputElement>) => {
        // UPDATE FORM STATE
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <form onSubmit={onSubmit}>
            <InputItem
                name="email"
                placeholder="email"
                type="text"
                mb={2}
                onChange={onChange}
            />
            <InputItem 
                name="password"
                placeholder="password"
                type="password"
                onChange={onChange}
            />
            <Text textAlign="center" mt={2} fontSize="10pt" color="red">
                {formError || FIREBASE_ERRORS[authError?.message as keyof typeof FIREBASE_ERRORS]}
            </Text>
            <Button
                width="100%"
                height="36px"
                mb={2}
                mt={2}
                type="submit"
                isLoading={loading}
            >
                Log In
            </Button>
            <Flex justifyContent="center" mb={2}>
                <Text fontSize="9pt" mr={1}>
                    Forgot your password?
                </Text>
                <Text
                    fontSize="9pt"
                    color="blue.500"
                    cursor="pointer"
                    onClick={() => toggleView("resetPassword")}
                >
                    Reset
                </Text>
            </Flex>
            <Flex fontSize="9pt" justifyContent="center">
                <Text mr={1}>New here?</Text>
                <Text
                    color="blue.500"
                    fontWeight={700}
                    cursor="pointer"
                    onClick={() => toggleView("signup")}
                >
                    SIGN IN
                </Text>
            </Flex>
        </form>
    );
};

export default Login;
