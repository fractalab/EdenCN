import React from "react";
import {
    TreasuryDisbursementsInfo,
    TreasuryHeader,
    TreasuryDelegateLevelsInfo,
} from "treasury";

import { SideNavLayout } from "_app";

export const TreasuryPage = () => {
    return (
        <SideNavLayout title="社區金庫">
            <div className="divide-y">
                <TreasuryHeader />
                <TreasuryDisbursementsInfo />
                <TreasuryDelegateLevelsInfo />
            </div>
        </SideNavLayout>
    );
};

export default TreasuryPage;
