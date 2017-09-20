//@req(nodeGroup, name, port)

import com.hivext.api.billing.Account;
import com.hivext.api.environment.Environment;
import com.hivext.api.development.Scripting;

var APPID = getParam("TARGET_APPID"),
    SESSION = getParam("session"),
    PROTOCOL = getParam("protocol", "TCP"),
    sSuccessText = "",
    bEndPointsEnabled,
    oEnvService,
    nNodesCount,
    oScripting,
    oEnvInfo,
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

if (!oResp.isOK()) {
    return oResp;
}

bEndPointsEnabled = toNative(oResp).array[0].value;

oEnvInfo = oEnvService.getEnvInfo();

if (!oEnvInfo.isOK()) {
    return oEnvInfo;
}

oEnvInfo = toNative(oEnvInfo);

nNodesCount = oEnvInfo.nodes.length;

if (bEndPointsEnabled) {
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
    
    sSuccessText = "To access your Mosquitto MQTT server, refer to the <b>${env.domain}</b> domain name through either <i>" + oResp.object.publicPort + "</i> port (for external access from wherever in the Internet) or <i>1883</i> port (for connecting within internal Plaform network)"
} else {
    sSuccessText = "To access your Mosquitto MQTT server, refer to the <b>${env.domain}</b> domain name through <i>1883</i> port (for connecting within internal Plaform network)<br>Jelastic Endpoints are limited by your quotas. So external access from wherever in the Internet is denied. Please contact to support or upgrade account to increase this possibility";
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
                "email": sSuccessText
            }
        }
    })
});
