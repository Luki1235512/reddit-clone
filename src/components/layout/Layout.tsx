import React, { ReactNode } from "react";
import Navbar from "@/src/components/navbar/Navbar";

type LayoutProps = {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({children}) => {
    return (
        <>
            <Navbar />
            <main>{children}</main>
        </>
    );
};

export default Layout;
