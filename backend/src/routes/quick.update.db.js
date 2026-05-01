import prisma from "../config/prima.js";

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
