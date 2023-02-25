import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { FieldType } from "./form";

export interface TemplateModel {
    name: string;
    id: string;
    group: {
        name: string,
        type: FieldType,
        defaults: string,
        values: string[]
    }[];
}
export interface PatientModel {
    id?: string
    name: string,
    dateOfBirth: NgbDateStruct,
    sex: string,
}

export interface StaffModel {
    id?: string,
    name: string,
    licNo: string
}

export interface PatientRecordModel {
    id?: string,
    date: string,
    patient: PatientModel,
    pathologist: StaffModel,
    performedBy: StaffModel,
    verifiedBy: StaffModel,
    specNo: string,
    orderingDoctor: string,
    status: string,
    specimen: string,
    ordered: string,
    collectionDateTime: string,
    receivedDateTime: string,
    comments: string
    data: string
}

export interface Pagination<T> {
    pageNumber: number,
    pageSize: number,
    content?: T[],
    numberOfElements?: number,
    totalPages?: number,
    empty?: boolean
}