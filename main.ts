/**
 * Functions to operate WizFi360.
 */
//% weight=10 color=#0fccdd icon="\uF1EB" block="WizFi360"
//% groups='["UartWizFi360"]'
namespace wizfi360 {
 
    let isWifiConnected = false

    /**
     * Setup WizFi360 WiFi
     */
    //% block="Setup Wifi|SSID = %ssid|Password = %passwd"
    //% group="UartWizFi360"
    export function setupWifi(ssid: string, passwd: string, timeout: number = 20000) {
        
        const atRespMap = {"OK": 1, "ERROR": 2, "None": 3}
        const atCWModeRespMap = {"OK": 1, "ERROR": 2, "None": 3}
        const atCWJAPRespMap = {"WIFI GOT IP": 1, "ERROR": 2, "None": 3}

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

        const atCmdRespMap = {"+CWJAP_CUR:": 1, "No AP": 2, "None": 3}

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
    export function waitAtResponse(respMap: object, timeout: number) {

        const start = input.runningTime()
        let buffer = ""
        const keys = Object.keys(respMap)

        while ((input.runningTime() - start) < timeout) {
            buffer += serial.readString()

            for (let k of keys) {
                if (buffer.includes(k)) {
                    return respMap[k];
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
