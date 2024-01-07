const URL = 'https://itappi-default-rtdb.firebaseio.com';
const EXPORT_FILE = '.json';
const URI_PATH = '/DICTIONARIES/'

export async function postExport(data: {ID:number,it:string,sp:string}[]) : Promise<string> {
    try {
        let res = await fetch(URL + '/' + URI_PATH + EXPORT_FILE ,{
            method: 'POST',
            headers:{
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data.map((word)=>{return({it:word.it,sp:word.sp})}))
        })
        res = await res.json();
        return res['name'];
    } catch (error) {
        console.error('An error has occurred: ', error);
        return null;
    }
}

export async function getExport(name: string) : Promise<Object[]> {
    try {
        let res = await fetch(URL + URI_PATH + name + EXPORT_FILE ,{
            method: 'GET',
            headers:{
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            //body: JSON.stringify(data.map((word)=>{return({it:word.it,sp:word.sp})}))
        })
        res = await res.json();
        let parsed = JSON.parse(JSON.stringify(res));
        return parsed;
    } catch (error) {
        console.log('An error has occurred: ', error);
        return null;
    }
}

export async function deleteExport(name: string) : Promise<Object[]> {
    try {
        let res = await fetch(URL + URI_PATH + name + '.json' ,{
            method: 'DELETE',
            headers:{
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
        })
        res = await res.json();
        let parsed = JSON.parse(JSON.stringify(res));
        return parsed;
    } catch (error) {
        console.error('An error has occurred: ', error);
        return null;
    }
}