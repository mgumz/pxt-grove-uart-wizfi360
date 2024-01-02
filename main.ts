
/**
 * Functions to operate WizFi360.
 */
//% weight=10 color=#9F79EE icon="\uf1b3" block="WizFi360"
//% groups='["Uart"]'
namespace wizfi360 {
 
    let isWifiConnected = false

    /**
     * Setup WizFi360 WiFi
     */
    //% block="Setup Wifi|TX %txPin|RX %rxPin|Baud rate %baudrate|SSID = %ssid|Password = %passwd"
    //% group="UartWizFi360"
    //% txPin.defl=SerialPin.P15
    //% rxPin.defl=SerialPin.P1
    //% baudRate.defl=BaudRate.BaudRate115200
    export function setupWifi(txPin: SerialPin, rxPin: SerialPin, baudRate: BaudRate, ssid: string, passwd: string) {
        let result = 0

        isWifiConnected = false

        serial.redirect(
            txPin,
            rxPin,
            baudRate
        )

        sendAtCmd("AT")
        result = waitAtResponse("OK", "ERROR", "None", 1000)

        sendAtCmd("AT+CWMODE=1")
        result = waitAtResponse("OK", "ERROR", "None", 1000)

        sendAtCmd(`AT+CWJAP="${ssid}","${passwd}"`)
        // FIXME: the response from the firmware might be different (different string)
        // FIXME: hence, the detection might depend on that

        // FIXME: make the 20s timeout being configurable
        result = waitAtResponse("WIFI GOT IP", "ERROR", "None", 20000)

        if (result == 1) {
            isWifiConnected = true
        }
    }

    /**
     * Check if WizFi360 is connected to Wifi
     */
    //% block="Wifi OK?"
    //% group="UartWizFi360"
    export function wifiOK() {
        return isWifiConnected
    }

    /**
     * Wait for previous executed AT command to return something
     * (target1, target2, target3)
     */
    //% block="WaitATResponse?"
    //% group="UartWizFi360"
    export function waitAtResponse(target1: string, target2: string, target3: string, timeout: number) {
        let buffer = ""
        let start = input.runningTime()

        while ((input.runningTime() - start) < timeout) {
            buffer += serial.readString()

            if (buffer.includes(target1)) return 1
            if (buffer.includes(target2)) return 2
            if (buffer.includes(target3)) return 3

            basic.pause(100)
        }

        return 0
    }

    /**
     * Send `cmd` 
     */
    //% block="sendAtCmd"
    //% group="UartWizFi360"
    export function sendAtCmd(cmd: string) {
        serial.writeString(cmd + "\u000D\u000A")
    }
}
