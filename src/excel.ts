import readXlsxFile from 'read-excel-file/node';
import fs from 'fs';

export interface IRow {
  link: string;
  pc_num: string;
  mainpc_num: string;
  first_name: string;
  last_name: string;
  father_name: string;
  id_code: string;
  birthdate: Date;
  email?: string;
  sex: string;
  phone?: string;
  paper_id_doc?: string;
  plastic_id_doc?: string;
  creation_date: Date;
  status_date: Date;
  close_date: Date;
  address: string;
  street: string;
  spec_code: string;
  post?: string;
  id_org_receive?: string;
  id_date?: Date;
  id_valid_date?: Date;
}

export function xslxData(path: any) {
  const map = {
    link: 'link',
    pc: 'pc_num',
    mainpc: 'mainpc_num',
    first_name: 'first_name',
    last_name: 'last_name',
    father_name: 'father_name',
    code: 'id_code',
    birthdate: 'birthdate',
    sex: 'sex',
    email: 'email',
    phone: 'phone',
    paper_id_doc: 'paper_id_doc',
    plastic_id_doc: 'plastic_id_doc',
    creation_date: 'creation_date',
    status_date: 'status_date',
    close_date: 'close_date',
    address: 'address',
    street: 'street',
    spec_code: 'spec_code',
    post: 'post',
    id_rec: 'id_org_receive',
    id_date: 'id_date',
    id_valid_date: 'id_valid_date',
  };
  let file = fs.readFileSync(path);
  return readXlsxFile(path, { map });
}
