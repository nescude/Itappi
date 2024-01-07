import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('itappi.db');

initDB();

export function insertWord(groupId: number, it: string, sp: string) {
    db.exec([{ sql: `INSERT INTO words (GROUP_ID,it,sp) values (?,?,?)`, args: [groupId, it, sp] }], false, (error) => { console.log(error) })
}

export function insertGroup(name: string) {
    db.exec([{ sql: `INSERT INTO groups (name,created_at) values (?,?)`, args: [name, Date.now()] }], false, (error) => { console.log(error) })
}

export function deleteWord(ID: number) {
    db.exec([{ sql: `DELETE FROM words WHERE ID = (?) `, args: [ID] }], false, (error) => { console.log(error) })
}

export function deleteGroup(ID: number, callback: VoidFunction) {
    db.exec([{ sql: `DELETE FROM groups WHERE ID = (?) `, args: [ID] }], false, callback)
    db.exec([{ sql: `DELETE FROM words WHERE GROUP_ID = (?) `, args: [ID] }], false, callback)
}

function initDB() {
    db.exec([{ sql: `CREATE DATABASE itappi`, args: [] }], false, () => { })
    db.exec([{
        sql: `CREATE TABLE IF NOT EXISTS words(
        ID INTEGER PRIMARY KEY,
        GROUP_ID INTEGER DEFAULT 0 NOT NULL,
        it TEXT,
        sp TEXT
    )`, args: []
    }], false, () => { })
    db.exec([{
        sql: `CREATE TABLE IF NOT EXISTS groups(
        ID INTEGER PRIMARY KEY DEFAULT 0,
        name TEXT,
        created_at TIMESTAMP
    )`, args: []
    }], false, () => { })
}

export async function dropWordsTable() {
    return execQuery(`DROP TABLE words`, []);
}

export async function getAllGroups() {
    return new Promise<GroupExportType[]>(async (resolve, reject) => {
        let result = (await (execQuery('SELECT * FROM groups', [])));
        if (result == undefined || result.rows == undefined || result.rows._array == undefined) resolve([]);
        else { resolve(result.rows._array); }
    })
}

export function deleteAllWords() {
    return execQuery(`DELETE FROM words`, []);
}

export async function getAllWords() {
    return new Promise<WordExportType[]>(async (resolve, reject) => {
        let result = await execQuery('SELECT * FROM words');
        if (result == undefined || result.rows == undefined || result.rows._array == undefined) resolve([]);
        else resolve(result.rows._array);
    })
}

function execQuery(query: string, values: Array<any> = []) {
    return new Promise<SQLite.SQLResultSet>((resolve, reject) => {
        let result: SQLite.SQLResultSet
        db.transaction((tx) => {

            tx.executeSql(query, values,
                (_, _result) => {
                    console.log('Executed', query);
                    result = _result
                },
            )
        },
            (error) => {
                console.error('SQLite Error', error);
                reject(error)
            },
            () => {

                console.log('Query succed result:', result);
                resolve(result)
            }
        )
    })
}

export type WordExportType = {
    ID?: number,
    GROUP_ID?: number,
    it: string,
    sp: string
}

export type GroupExportType = {
    ID: number,
    name: string,
    created_at: Date
}