"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Data {
    static formatar(data = new Date()) {
        const pad = (n) => {
            return (n < 10 ? '0' : '') + n;
        };
        const ano = data.getFullYear();
        const mes = pad(data.getMonth() + 1);
        const dia = pad(data.getDate());
        const hora = pad(data.getHours());
        const minuto = pad(data.getMinutes());
        return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
    }
    static desformatar(data) {
        const [ano, mes, dia] = data.split("T")[0].split("-");
        const [hora, minuto] = data.split("T")[1].split(":");
        return new Date(parseInt(ano, 10), parseInt(mes, 10) - 1, parseInt(dia, 10), parseInt(hora, 10), parseInt(minuto, 10));
    }
}
exports.default = Data;
