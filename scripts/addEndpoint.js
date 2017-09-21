//@req(nodeGroup, name, port)

var PROTOCOL = getParam("protocol", "TCP"),
    APPID = getParam("TARGET_APPID"),
    SESSION = getParam("session"),
    bEndPointsEnabled,
    sSuccessText = "",
    nNodesCount,
    oEnvInfo,
    oResp,
    i;

oResp = jelastic.billing.account.GetQuotas("environment.endpoint.enabled");

if (!oResp || oResp.result != 0) {
    return oResp;
}

bEndPointsEnabled = oResp.array[0].value;

oEnvInfo = jelastic.environment.environment.GetEnvInfo(APPID, session);

if (!oEnvInfo || oEnvInfo.result != 0) {
    return oEnvInfo;
}

nNodesCount = oEnvInfo.nodes.length;

if (bEndPointsEnabled) {
    for (i = 0; i < nNodesCount; i += 1) {
        if (oEnvInfo.nodes[i].nodeGroup == nodeGroup) {
            oResp = jelastic.environment.environment.AddEndpoint(APPID, session, oEnvInfo.nodes[i].id, port, PROTOCOL, name);

            if (!oResp || oResp.result != 0) {
                return oResp;
            }
        }
    }

    sSuccessText = "To access your Mosquitto MQTT server, refer to the <b>${env.domain}</b> domain name through either<ul><li> <i>" + oResp.object.publicPort + "</i> port (for external access from wherever in the Internet)</li><li> or <i>1883</i> port (for connecting within Plaform internal network, i.e. from another Jelastic container).</li></ul>";
} else {
    sSuccessText = "To access your Mosquitto MQTT server, refer to the <b>tcp://${env.domain}: 1883</b> (for connecting within Plaform internal network, i.e. from another Jelastic container).<br><br>Jelastic Endpoints are limited by your quotas. So external access from wherever in the Internet is denied. Please contact to support or upgrade account to increase this possibility. <br><br>After that add Endpoints to your environment on your compute node. More details how to add endpoints are <a href=\'https://docs.jelastic.com/endpoints\'>here.</a>";
}

return {
    result: "success",
    message: sSuccessText,
    email: sSuccessText
};
