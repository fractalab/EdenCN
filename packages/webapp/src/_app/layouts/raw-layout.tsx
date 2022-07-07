import Head from "next/head";

import { HeaderNav, Footer } from "../ui";

interface Props {
    title?: string;
    children: React.ReactNode;
    banner?: React.ReactNode;
}

export const RawLayout = ({ children, title, banner }: Props) => (
    <div className="bg-gray-50 flex flex-col min-h-screen">
        <HeaderNav />
        <Head>
            <title>{title && `${title} | `} Eden</title>
        </Head>
        {banner}
        <main className="md:container md:mx-auto pt-4 md:pt-8 flex-grow">
            {children}
        </main>
        <Footer />
    </div>
);
