const axios = require('axios');
require('dotenv').config()

const contatos = [
    "49999184629",
    "49991108888",//GORDO
    "49984030021"//CARRARO
];
const config_nobreaks =   [
    ["10443", 'no-break01', contatos],
    ["10434", 'no-break02', contatos]
];
const nivel_bateria = 98 //Parametro que define o nivel da bateria que irá começar a notificar

//var auth = ''
//var battery = ''

const url = process.env.URL_ZABBIX

config_nobreaks.forEach(item => {
    autentica(url).then((response) => {
        var auth = response.data.result
        busca_battery_capacity(url, response.data.result, item[0])
        .then((response) => {
            //console.log(response.data.result[0].lastvalue);
            item[2].forEach(contato => {
                let capacidade = response.data.result[0].lastvalue
                //console.log(capacidade)
                if(capacidade <= nivel_bateria){
                    //console.log(item[0])
                    busca_voltage(url, auth, item)
                    .then((response) => {
                        //console.log(response.data.result[0].lastvalue);
                        if(response.data.result[0].lastvalue != "0"){ // Valida se a entrada de eneria está zerada, se estiver envia mensagem
                            console.log("Alerta!")
                            var mensagem = "ALERTA!!!\nNivel do nobreak "+ item[1] +": " + capacidade +"%";
                            var destino = contato
                            enviarmensagem(destino, mensagem)
                        }
                    })
                }else if(response.data.result[0] === ''){// Se o nobreak não estiver retornando informações ele envia mensagens
                    var mensagem = "Problema de conexão com o no break "+ item[1];
                    var destino = contato
                    enviarmensagem(destino, mensagem)
                }
            })
        })
    })

})

function enviarmensagem(destino, mensagem){
    const url_mensagem = process.env.URL_ENVIA_MENSAGEM
    axios.post(url_mensagem, {
            number:destino,
            message:mensagem,
            by:"alerta"
        })
}

async function autentica(url_zabbix) {
    return await axios.post(url_zabbix, {
        jsonrpc: "2.0",
        method: "user.login",
        params: {
            user: "Admin",
            password: "zabbix"
        },
        id: 1
    })
}
async function busca_battery_capacity(url_zabbix, auth, id_nobreak) {
        var bateriaGeradores =  await axios.post(url_zabbix, {
            jsonrpc: "2.0",
            method: "item.get",
            params: {
                output: "extend",
                hostids: id_nobreak,
                search: {
                    key_: "upsAdvBatteryCapacity",
                },
                sortfield: "name"
            },
            auth: auth,
            id: 1
        })
    return bateriaGeradores;
}

async function busca_voltage(url_zabbix, auth, id_nobreak) {
    //console.log(id_nobreak[0]+"-------")
    var voltagem =  await axios.post(url_zabbix, {
        jsonrpc: "2.0",
        method: "item.get",
        params: {
            output: "extend",
            hostids: id_nobreak[0],
            search: {
                key_: "upsAdvInputVoltage",
            },
            sortfield: "name"
        },
        auth: auth,
        id: 1
    })
return voltagem;
}
//
// autentica(url).then(function (response) {
//    auth = response.data.result
//    
//    for(var i = 0; i < config_nobreaks.length; i++) {
//        
//       
//        busca_battery_capacity(url, auth, config_nobreaks[i]).then(function (response) {
//            battery = response.data.result[0].lastvalue
//            if(battery == 100){
//                
//                for(var x = 0; x < contatos.length; x++) {
//                    var mensagem = "!!!Nivel do nobreak "+ config_nobreaks[x] +": " + battery +"%";
//                    var numero = contatos[x]
//                    console.log(mensagem + '------------' + numero)
//                    console.log(numero)
//                    enviarmensagem(numero, mensagem)
//                }
//            }
//        })   
//    }
// })
//


