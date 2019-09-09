export interface InputFile{
    fieldname: string,
    originalname: string,
    encoding: string,
    mimetype: string,
    buffer?: Buffer,
    size: number,
    path?: string,
    filename?: string,
    destination?: string
}
