import { useQueries } from "react-query";

import { queryInduction } from "_app";
import * as InductionTable from "_app/ui/table";

import { getInductionRemainingTimeDays } from "../../utils";
import { Endorsement, Induction, InductionRole } from "../../interfaces";
import { InductionStatusButton } from "./induction-status-button";
import { EndorsersNames } from "./induction-names";

interface Props {
    endorsements: Endorsement[];
    isActiveCommunity?: boolean;
}

export const EndorserInductions = ({
    endorsements,
    isActiveCommunity,
}: Props) => {
    const inductionsQueries = endorsements.map((endorsement) =>
        queryInduction(endorsement.induction_id)
    );
    const inductions = useQueries(inductionsQueries)
        .filter((query) => query.data)
        .map((query) => query.data) as Induction[];

    return (
        <InductionTable.Table
            columns={ENDORSER_INDUCTION_COLUMNS}
            data={getTableData(endorsements, inductions)}
            tableHeader={
                isActiveCommunity
                    ? "等待我確認的邀請"
                    : "等待以下成員確認"
            }
        />
    );
};

// TODO: Show witness names again once we have the blockchain microchain state machine in place for these tables.
// They're kicking off too many requests and causing the RPC nodes to rate limit individual user IPs.
const ENDORSER_INDUCTION_COLUMNS: InductionTable.Column[] = [
    {
        key: "invitee",
        label: "被邀請人",
    },
    // {
    //     key: "inviterAndWitnesses",
    //     label: "Inviter & witnesses",
    //     className: "hidden md:flex",
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

const getTableData = (
    endorsements: Endorsement[],
    inductions: Induction[]
): InductionTable.Row[] => {
    return endorsements.map((endorsement) => {
        const induction = inductions.find(
            (induction) => induction.id === endorsement.induction_id
        );

        const invitee =
            induction && induction.new_member_profile.name
                ? induction.new_member_profile.name
                : endorsement.invitee;

        return {
            key: `${endorsement.induction_id}-${endorsement.id}`,
            invitee,
            // inviterAndWitnesses: induction ? (
            //     <EndorsersNames
            //         induction={induction}
            //         skipEndorser={endorsement.endorser}
            //     />
            // ) : (
            //     "Unknown"
            // ),
            time_remaining: getInductionRemainingTimeDays(induction),
            status: induction ? (
                <InductionStatusButton
                    induction={induction}
                    role={InductionRole.Endorser}
                />
            ) : (
                "Unknown"
            ),
        };
    });
};
