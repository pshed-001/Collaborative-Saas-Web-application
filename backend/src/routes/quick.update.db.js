import prisma from "../config/prisma.js";
/*
const register = async () => {
    try {
        const updateRecord = await prisma.user.update({
            where: {
                username: "dev2",
            },
            data: {
                username: "dev2@itgel",
            },
        });
        console.log(updateRecord)
    }catch(err){
        console.log(err)
    }
};
*/
async function updateDate(){
    try{
        const updateTask  = await prisma.task.update({
            where : {
                id : "27cae73b-ee1a-4329-9fd1-4dac775f9a68",
            },
            data : {
                duedate : new Date("2026-07-11")
            }
        })
        console.log(updateTask)
    }catch(err){
        console.log(err)
    }
}
const data = await updateDate();
console.log(data)