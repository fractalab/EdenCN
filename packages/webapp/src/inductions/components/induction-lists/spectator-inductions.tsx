import * as InductionTable from "_app/ui/table";

import { getInductionRemainingTimeDays } from "../../utils";
import { Induction } from "../../interfaces";
import { InductionStatusButton } from "./induction-status-button";
import { AccountName, EndorsersNames } from "./induction-names";

interface Props {
    inductions: Induction[];
}

export const SpectatorInductions = ({ inductions }: Props) => (
    <InductionTable.Table
        columns={SPECTATOR_COLUMNS}
        data={getTableData(inductions)}
        tableHeader="進行中的邀請"
    />
);

// TODO: Show witness names again once we have the blockchain microchain state machine in place for these tables.
// They're kicking off too many requests and causing the RPC nodes to rate limit individual user IPs.
const SPECTATOR_COLUMNS: InductionTable.Column[] = [
    {
        key: "invitee",
        label: "被邀請人",
    },
    {
        key: "inviter",
        label: "邀請人",
        className: "hidden sm:flex",
    },
    // {
    //     key: "witnesses",
    //     label: "Witnesses",
    //     className: "hidden lg:flex",
    // },
    {
        key: "time_remaining",
        label: "剩餘時間",
        className: "hidden md:flex",
    },
    {
        key: "status",
        label: "當前狀態",
        type: InductionTable.DataTypeEnum.Action,
    },
];

const getTableData = (inductions: Induction[]): InductionTable.Row[] => {
    return inductions.map((induction) => {
        return {
            key: induction.id,
            invitee: induction.new_member_profile?.name || induction.invitee,
            inviter: <AccountName account={induction.inviter} />,
            // witnesses: (
            //     <EndorsersNames
            //         induction={induction}
            //         skipEndorser={induction.inviter}
            //     />
            // ),
            time_remaining: getInductionRemainingTimeDays(induction),
            status: <InductionStatusButton induction={induction} />,
        };
    });
};
