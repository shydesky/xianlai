/**
 * Created by yungu on 16/7/30.
 */

var GameInfo=(function()
{
    var unique;
    function getInstance(){
        return unique || ( unique = new GameInfoClass() );
    }
    return {
        getInstance : getInstance
    }
})();
var GameInfoClass=function()
{
    this.gameTime=0;
    this.gameFrameTime=100
    this.initBlood=125;//125;//125;//125;//;
    this.maxBlood=20000000;
    this.maxGameTime=10*60*1000;
    this.maxSpeed=100;
    this.mapMax=2400;
    this.maxCount=60;
    this.stateServerUrl="127.0.0.1";//"121.42.15.211";

    this.httpServerPort=8011;
    this.webSocketPort=9100;

    this.botStatePort=7000;
    this.uploadPort=7101;
    this.botCount=3;
    this.managerPort=5101;

    this.uploadDir="/opt/game/apache-tomcat-8.0.33/webapps/ROOT/voice";
    //this.uploadDir="/work/http/voice";
    this.imageDir="/work/http/image";
    this.playHistoryDir="/opt/game/apache-tomcat-8.0.33/webapps/ROOT/history";
    //this.playHistoryDir="/work/http/history";
    this.disMissWaitTime=2*60;

    this.canExcuteCmdIp=["*"];

}
module.exports = GameInfo;