//@req(nodeGroup, name, port)

var APPID = getParam("TARGET_APPID"),
    //SESSION = getParam("session"),
    PROTOCOL = getParam("protocol", "TCP"),
    oEnvService,
    oEnvInfo,
    nNodesCount,
    oScripting,
    oResp,
    i;

/*
oEnvService = hivext.local.exp.wrapRequest(new Environment(APPID, SESSION));
 
oScripting =  hivext.local.exp.wrapRequest(new Scripting({
    serverUrl : "http://" + window.location.host.replace("app", "appstore") + "/",
    session : SESSION
}));

*/

oEnvInfo = jelastic.env.control.GetEnvInfo(APPID, session);

if (!oEnvInfo.isOK()) {
    return oEnvInfo;
}

//oEnvInfo = toNative(oEnvInfo);

nNodesCount = oEnvInfo.nodes.length;

for (i = 0; i < nNodesCount; i += 1) {
    if (oEnvInfo.nodes[i].nodeGroup == nodeGroup) {
        oResp = jelastic.env.constrol..AddEndpoint({
            name: name,
            nodeid: oEnvInfo.nodes[i].id,
            privatePort: port,
            protocol: PROTOCOL
        });

        if (!oResp.isOK()) {
            return oResp;
        }
        oResp = toNative(oResp);
    }
}

return jelastic.development.scripting.Eval({
    script : "InstallApp",
    targetAppid : APPID,
    manifest : toJSON({
        "jpsType" : "update",
        "application" : {
            "id": "Mosquitto",
            "name": "Mosquitto",
            "success": {
                "email": "To access your Mosquitto MQTT server, refer to the **${env.domain}** domain name through either *" + oResp.object.publicPort + "* port (for external access from wherever in the Internet) or *1883* port (for connecting within internal Plaform network)"
            }
        }
    })
});
