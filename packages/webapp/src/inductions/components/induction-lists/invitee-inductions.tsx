import { useMemberByAccountName } from "_app";
import * as InductionTable from "_app/ui/table";

import { getInductionRemainingTimeDays } from "../../utils";
import { Induction, InductionRole } from "../../interfaces";
import { InductionStatusButton } from "./induction-status-button";
import { AccountName, EndorsersNames } from "./induction-names";

interface Props {
    inductions: Induction[];
}

export const InviteeInductions = ({ inductions }: Props) => (
    <InductionTable.Table
        columns={INVITEE_INDUCTION_COLUMNS}
        data={getTableData(inductions)}
        tableHeader="我的邀請"
    />
);

const INVITEE_INDUCTION_COLUMNS: InductionTable.Column[] = [
    {
        key: "inviter",
        label: "邀請人",
    },
    {
        key: "witnesses",
        label: "證人",
        className: "hidden md:flex",
    },
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
    return inductions.map((induction) => ({
        key: induction.id,
        inviter: <AccountName account={induction.inviter} />,
        witnesses: (
            <EndorsersNames
                induction={induction}
                skipEndorser={induction.inviter}
            />
        ),
        time_remaining: getInductionRemainingTimeDays(induction),
        status: (
            <InductionStatusButton
                induction={induction}
                role={InductionRole.Invitee}
            />
        ),
    }));
};
