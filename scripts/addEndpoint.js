//@req(nodeGroup, name, port)

import com.hivext.api.billing.Account;
import com.hivext.api.environment.Environment;
import com.hivext.api.development.Scripting;

var APPID = getParam("TARGET_APPID"),
    SESSION = getParam("session"),
    PROTOCOL = getParam("protocol", "TCP"),
    oEnvService,
    oEnvInfo,
    nNodesCount,
    oScripting,
    bEndPointsEnabled,
    oResp,
    i;

oEnvService = hivext.local.exp.wrapRequest(new Environment(APPID, SESSION));
oAccountQoutaService = hivext.local.exp.wrapRequest(new Account(appid, SESSION));
oScripting =  hivext.local.exp.wrapRequest(new Scripting({
    serverUrl : "http://" + window.location.host.replace("app", "appstore") + "/",
    session : SESSION
}));

oResp = oAccountQoutaService.getQuotas({
    quotasnames: "environment.endpoint.enabled"
});

bEndPointsEnabled = toNative(oResp).array[0].value;
return 7 + bEndPointsEnabled + 6;

if (!oResp.isOK()) {
    return oResp;
}

bEndPointsEnabled = toNative(oResp).array[0].value;
return 7 + bEndPointsEnabled + 7;

oEnvInfo = oEnvService.getEnvInfo();

if (!oEnvInfo.isOK()) {
    return oEnvInfo;
}

oEnvInfo = toNative(oEnvInfo);

nNodesCount = oEnvInfo.nodes.length;

for (i = 0; i < nNodesCount; i += 1) {
    if (oEnvInfo.nodes[i].nodeGroup == nodeGroup) {
        oResp = oEnvService.addEndpoint({
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

return oScripting.eval({
    script : "InstallApp",
    targetAppid : APPID,
    manifest : toJSON({
        "jpsType" : "update",
        "application" : {
            "id": "Mosquitto",
            "name": "Mosquitto",
            "success": {
                "email": "To access your Mosquitto MQTT server, refer to the <b>${env.domain}</b> domain name through either *" + oResp.object.publicPort + "* port (for external access from wherever in the Internet) or *1883* port (for connecting within internal Plaform network)"
            }
        }
    })
});
