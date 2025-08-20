import { DocumentDTO } from "app/shared/types/file.types";
import { BasicCommitteeDTO } from "../committees/committees.types";
import {Director} from "../directors/directors.types";


export interface Agenda {
  code?: string;
  title: string;
  description: string;
  full_description: string;
  decision: Decision;
  status: string;
  owner: string;
  due_at: string;
  is_activated: boolean;
}

export interface Meeting {
  _id?: string;
  code?: string;
  name?: string;
  title: string;
  description?: string;
  full_description?: string;
  starting_at: string;
  ending_at: string;
  is_deleted?: boolean;
  attendees?: Director[];
  agenda?: Agenda[];
  reason_for_deletion: string;
  type: string;
  committee?: BasicCommitteeDTO | string;
  meeting_no?: number;
  documents?: DocumentDTO[];
  organizationCode?: string;
}

export interface Decision {
  _id?: string;
  code?: string;
  description: string;
  owner: string;
  due_at: string;
  documents: {code: string}[];
}

export enum MeetingTypeEnum {
  BOARD_MEETING = "Board Meeting",
  COMMITTEE_MEETING = "Committee Meeting",
  ANNUAL_GENERAL_MEETING = "Annual General Meeting"
}