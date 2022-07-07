import React from "react";
import dayjs from "dayjs";

import { useCurrentElection } from "_app";
import { Container, Heading, Text } from "_app/ui";
import { extractElectionDates } from "elections";

export const ElectionScheduleSegment = () => {
    const {
        data: currentElection,
        isLoading: isLoadingElection,
        isError: isErrorElection,
    } = useCurrentElection();

    if (isLoadingElection || isErrorElection || !currentElection) return null; // fail silently

    let electionDates = null;
    try {
        electionDates = extractElectionDates(currentElection);
    } catch (e) {
        return null;
    }

    // don't show anything if the next election is more than 2 weeks out
    if (dayjs().isBefore(electionDates.startDateTime.subtract(2, "weeks"))) {
        return null;
    }

    return (
        <Container className="space-y-2.5">
            <Heading size={3}>選舉時間安排</Heading>
            <Text>This is the projected timeline for election day.</Text>
            <Text>
                雖然不要求參與者們必須在競選輪次之外繼續呆在社區大會議室內，但我們仍然希望你留在那裡，和大家一同進行討論。
            </Text>
            <Text type="info">
            以下所説均為 ({electionDates.startDateTime.format("z")})時間
            </Text>
            <Schedule>
                <ScheduleEntry timeUtc="12:00">
                    社區 Zoom 會議室開啟。我們將向大家介紹選舉流程，需要做哪些準備以及回答大家的問題。（30 分鐘）
                </ScheduleEntry>
                <ScheduleEntry timeUtc="12:30">
                    在社區大會議室舉行開幕儀式（30 分鐘）
                </ScheduleEntry>
                <ScheduleEntry timeUtc="13:00">
                    9:00 PM: 選舉活動正式開始，開始第一輪次分組選舉（1 小時）
                </ScheduleEntry>
                <ScheduleEntry timeUtc="14:00">
                    第二輪次分組選舉開始（1 小時）
                </ScheduleEntry>
                <ScheduleEntry timeUtc="15:00">
                    選出社區首席代表
                </ScheduleEntry>
                <ScheduleEntry timeUtc="16:00">
                    社區首席代表在社區大會議室討論並回答社區提問（1 小時）
                </ScheduleEntry>
                <ScheduleEntry timeUtc="17:00">
                    依照規則抽簽確定主席人選。選舉活動結束。開始向社區代表分配資金。
                </ScheduleEntry>
            </Schedule>
        </Container>
    );
};

export default ElectionScheduleSegment;

interface ScheduleEntry {
    timeUtc: string;
    children: React.ReactNode;
}

const ScheduleEntry = ({ timeUtc, children }: ScheduleEntry) => {
    const timeString = dayjs(`2021-10-09T${timeUtc}:00.000Z`).format("LT");
    return (
        <li>
            <div className="flex flex-col sm:flex-row sm:space-x-1">
                <div
                    className="font-medium sm:text-right"
                    style={{ width: 80 }}
                >
                    {timeString}
                    <span className="hidden sm:inline">:</span>
                </div>
                <div className="flex-1">{children}</div>
            </div>
        </li>
    );
};

interface ScheduleProps {
    children: React.ReactNode;
}

const Schedule = ({ children }: ScheduleProps) => (
    <ul className="space-y-4 sm:space-y-2.5 leading-5 tracking-tight text-gray-700">
        {children}
    </ul>
);
