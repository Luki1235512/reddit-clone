import React from "react";
import Navbar from "@/src/components/navbar";

const Layout: React.FC<{children: React.ReactNode}> = ({children}) => {
    return (
        <>
            <Navbar />
            {children}
        </>
    );
};

export default Layout;
