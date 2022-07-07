import React, { useState } from "react";
import Link from "next/link";
import { Popover } from "@headlessui/react";
import { usePopper } from "react-popper";
import { IoMdLogIn } from "react-icons/io";

import { ROUTES } from "_app/routes";
import { useSignOut } from "_app/hooks";
import { Button, ProfileImage, Text } from "_app/ui";
import { Member, useCurrentMember } from "members";

import { useUALAccount } from "../eos";

interface Props {
    location: "side-nav" | "mobile-nav";
}

export const NavProfile = ({ location }: Props) => {
    const [ualAccount, _, ualShowModal] = useUALAccount();
    const { data: member } = useCurrentMember();

    if (!ualAccount) {
        return (
            <div className="flex justify-end xs:justify-center md:justify-end xl:justify-start mb-0 xs:mb-8 my-0">
                <Button
                    onClick={ualShowModal}
                    size="sm"
                    className="md:hidden"
                    title="登錄"
                    dataTestId="signin-nav-button"
                >
                    <span className="block xs:hidden">登錄</span>
                    <IoMdLogIn size="24" className="hidden xs:block" />
                </Button>
                <Button
                    onClick={ualShowModal}
                    className="hidden md:block"
                    title="登錄"
                    dataTestId="signin-nav-buttonsm"
                >
                    <span className="hidden lg:block">登錄</span>
                    <IoMdLogIn size="24" className="block lg:hidden" />
                </Button>
            </div>
        );
    }

    let WRAPPER_CLASS = "flex justify-end xl:justify-start items-center";
    let CONTAINER_CLASS =
        "flex rounded-full space-x-1.5 hover:bg-gray-100 transition duration-300 ease-in-out";

    if (location === "side-nav") {
        WRAPPER_CLASS += " mb-8";
        CONTAINER_CLASS += " p-3";
    }

    // TODO: Get our Link component up to snuff and start depending in that
    // TODO: Handle long names
    // TODO: Don't let ProfileImage collapse when at smaller breakpoints
    // TODO: Handle loaders and error state, non-member state
    return (
        <div className={WRAPPER_CLASS}>
            <PopoverWrapper location={location} member={member}>
                <div className={CONTAINER_CLASS}>
                    <div className="cursor-pointer">
                        <ProfileImage
                            imageUrl={member?.profile?.image.url}
                            size={40}
                        />
                    </div>
                    <div className="hidden xl:block text-left">
                        <Text size="sm" className="font-semibold">
                            {member?.profile?.name ?? "Not a member"}
                        </Text>
                        <Text size="sm">
                            @{member?.accountName ?? ualAccount?.accountName}
                        </Text>
                    </div>
                </div>
            </PopoverWrapper>
        </div>
    );
};

export default NavProfile;

interface PopoverProps extends Props {
    children: React.ReactNode;
    member?: Member | null;
}

const PopoverWrapper = ({ children, member, location }: PopoverProps) => {
    const [
        referenceElement,
        setReferenceElement,
    ] = useState<HTMLButtonElement | null>(null);
    const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
        null
    );
    const { styles, attributes } = usePopper<HTMLDivElement | null>(
        referenceElement,
        popperElement,
        { placement: location === "mobile-nav" ? "bottom-end" : "top-start" }
    );

    const signOut = useSignOut();

    const isActiveMember = Boolean(member?.profile);

    return (
        <Popover
            className={`xl:w-full ${location === "mobile-nav" ? "h-10" : ""}`}
        >
            <Popover.Button
                ref={setReferenceElement}
                className="xl:w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
            >
                {children}
            </Popover.Button>
            <Popover.Panel
                ref={setPopperElement}
                style={styles.popper}
                {...attributes.popper}
            >
                <div
                    className="w-48 bg-white mb-2 mt-1 rounded-xl divide-y divide-gray-100"
                    style={{
                        boxShadow: "2px 2px 25px rgba(0, 0, 0, 0.15)",
                    }}
                >
                    {isActiveMember && (
                        <Link
                            href={`${ROUTES.MEMBERS.href}/${member?.accountName}`}
                        >
                            <a className="block p-6 w-full hover:bg-gray-100 text-left">
                                <Text>個人資料</Text>
                            </a>
                        </Link>
                    )}
                    <button
                        onClick={signOut}
                        title="退出登錄"
                        className="block p-6 w-full hover:bg-gray-100 text-left"
                    >
                        <Text>退出登錄</Text>
                    </button>
                </div>
            </Popover.Panel>
        </Popover>
    );
};
