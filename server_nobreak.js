const axios = require('axios');


var config_nobreaks =   {
    nb01_id: "10443",
    nb02_id: "10434"
};

var auth = ''

const url = 'http://10.3.0.34/zabbix/api_jsonrpc.php'

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
    return await axios.post(url_zabbix, {
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
}

autentica(url)
    .then(function (response) {
        auth = response.data.result
        busca_battery_capacity(url, auth, config_nobreaks.nb01_id)
            .then(function (response) {
                console.log(response.data.result[0].lastvalue)
            })
            .catch(function (error) {
                console.log(error)
            })
    })
    .catch(function (error) {
        console.log(error)
    })


