import * as colors from 'colors';
import server from "./server";

const port  = process.env.PORT || "5000"

server.listen(port, () => {
    console.log(colors.blue.bgYellow(`Servidor corriendo en el puerto:  ${port}`));
})
