/**
 * Functions to operate WizFi360.
 */
//% weight=10 color=#0fccdd icon="\uF1EB" block="WizFi360"
//% groups='["UartWizFi360"]'
namespace wizfi360 {
 
    interface ATRespMatch {
        match: string
        rc: number
    }

    type ATRespMatches = ATRespMatch[]


    let isWifiConnected = false

    /**
     * Setup WizFi360 WiFi
     */
    //% block="Setup Wifi|SSID = %ssid|Password = %passwd"
    //% group="UartWizFi360"
    export function setupWifi(ssid: string, passwd: string, timeout: number = 20000) {
        
        const atRespMap: ATRespMatches = [{match: "OK", rc: 1}, {match: "ERROR", rc: 2}, {match: "None", rc: 3}]
        const atCWModeRespMap: ATRespMatches = [{match:"OK", rc: 1}, {match: "ERROR", rc: 2}, {match: "None", rc: 3}]
        const atCWJAPRespMap: ATRespMatches = [{match:"WIFI GOT IP", rc: 1}, {match: "ERROR", rc: 2}, {match: "None", rc: 3}]

        let result = 0
        
        isWifiConnected = false
  
        sendAtCmd("AT")
        result = waitAtResponse(atRespMap, 1000)

        sendAtCmd("AT+CWMODE=1")
        result = waitAtResponse(atCWModeRespMap, 1000)

        sendAtCmd(`AT+CWJAP_CUR="${ssid}","${passwd}"`)
        result = waitAtResponse(atCWJAPRespMap, timeout)

        if (result == 1) {
            isWifiConnected = true
        }
    }

    /**
     * Check if WizFi360 is connected to Wifi
     */
    //% block="Wifi OK?"
    //% group="UartWizFi360"
    export function wifiOK(timeout: number = 5000): boolean {

        const atCmdRespMap: ATRespMatches = [{match: "+CWJAP_CUR:", rc: 1}, {match: "No AP", rc: 2}, {match: "None", rc:3 }]

        sendAtCmd("AT+CWJAP_CUR?")

        let result = waitAtResponse(atCmdRespMap, timeout)
        if (result == 1) {
            isWifiConnected = true
            return true
        }
        isWifiConnected = false
        return false
    }


    /**
     * Send ICMP packet to destination
     */
    //% block="Ping|DST %dst"
    //% group="UartWizFi360"
    //% dst.defl="127.0.0.1"
    export function ping(dst: string) {
        sendAtCmd("AT+PING=${dst}")
    }


    /**
     * Wait for previous executed AT command to return something
     * returns 1 when target1 is matching, 2 when target2 is matching and
     * 3 when target3 is matching
     */
    //% block="WaitATResponse?"
    //% group="UartWizFi360"
    export function waitAtResponse(respList: ATRespMatches, timeout: number) {

        const start = input.runningTime()
        let buffer = ""

        while ((input.runningTime() - start) < timeout) {
            buffer += serial.readString()

            for (let r of respList) {
                if (buffer.includes(r.match)) {
                    return r.rc;
                }
            }

            basic.pause(100)
        }

        return 0
    }

    /**
     * Send `cmd` 
     */
    //% block="sendAtCmd|cmd %cmd|"
    //% group="UartWizFi360"
    //% cmd.defl="AT"
    export function sendAtCmd(cmd: string) {
        serial.writeString(cmd + serial.NEW_LINE)
    }


    export function readString(): string {
        return ""
    }
}
