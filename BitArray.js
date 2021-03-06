var btoa = require('btoa');
var atob = require('atob');

var BitArray = (function() {
    // converts binary string to a hexadecimal string
    // returns an object with key 'valid' to a boolean value, indicating
    // if the string is a valid binary string.
    // If 'valid' is true, the converted hex string can be obtained by
    // the 'result' key of the returned object
    function binaryToHex(s) {
        var i, k, part, accum, ret = '';
        for (i = s.length - 1; i >= 3; i -= 4) {
            // extract out in substrings of 4 and convert to hex
            part = s.substr(i + 1 - 4, 4);
            accum = 0;
            for (k = 0; k < 4; k += 1) {
                if (part[k] !== '0' && part[k] !== '1') {
                    // invalid character
                    return {
                        valid: false
                    };
                }
                // compute the length 4 substring
                accum = accum * 2 + parseInt(part[k], 10);
            }
            if (accum >= 10) {
                // 'A' to 'F'
                ret = String.fromCharCode(accum - 10 + 'A'.charCodeAt(0)) + ret;
            } else {
                // '0' to '9'
                ret = String(accum) + ret;
            }
        }
        // remaining characters, i = 0, 1, or 2
        if (i >= 0) {
            accum = 0;
            // convert from front
            for (k = 0; k <= i; k += 1) {
                if (s[k] !== '0' && s[k] !== '1') {
                    return {
                        valid: false
                    };
                }
                accum = accum * 2 + parseInt(s[k], 10);
            }
            // 3 bits, value cannot exceed 2^3 - 1 = 7, just convert
            ret = String(accum) + ret;
        }
        return {
            valid: true,
            result: ret
        };
    }

    // converts hexadecimal string to a binary string
    // returns an object with key 'valid' to a boolean value, indicating
    // if the string is a valid hexadecimal string.
    // If 'valid' is true, the converted binary string can be obtained by
    // the 'result' key of the returned object
    function hexToBinary(s) {
        var i, k, part, ret = '';
        // lookup table for easier conversion. '0' characters are padded for '1' to '7'
        var lookupTable = {
            '0': '0000',
            '1': '0001',
            '2': '0010',
            '3': '0011',
            '4': '0100',
            '5': '0101',
            '6': '0110',
            '7': '0111',
            '8': '1000',
            '9': '1001',
            'a': '1010',
            'b': '1011',
            'c': '1100',
            'd': '1101',
            'e': '1110',
            'f': '1111',
            'A': '1010',
            'B': '1011',
            'C': '1100',
            'D': '1101',
            'E': '1110',
            'F': '1111'
        };
        for (i = 0; i < s.length; i += 1) {
            if (lookupTable.hasOwnProperty(s[i])) {
                ret += lookupTable[s[i]];
            } else {
                return {
                    valid: false
                };
            }
        }
        return {
            valid: true,
            result: ret
        };
    }

    function hexToBase64(str) {
        return btoa(String.fromCharCode.apply(null,
            str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
    }

    function base64ToHex(str) {
        for (var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
            var tmp = bin.charCodeAt(i).toString(16);
            if (tmp.length === 1) tmp = "0" + tmp;
            hex[hex.length] = tmp;
        }
        return hex.join("");
    }

    function BitArray(size) {
        this.size = size;
        this.data = [];
        for (var i = 0; i < size; i++) {
            this.data.push(false);
        }
    }

    BitArray.prototype.set = function(index) {
        this.data[index] = true;
    };

    BitArray.prototype.clear = function(index) {
        this.data[index] = false;
    };

    BitArray.prototype.value = function(index, value) {
        if (value === undefined) return this.data[index];
        this.data[index] = !!value;
    };

    BitArray.prototype.toBase64 = function() {
        var s = '';
        for (var i = 0; i < this.data.length; i++) {
            s = s + (this.data[i] ? '1' : '0');
        }
        return hexToBase64(binaryToHex(s).result);
    };

    BitArray.prototype.fromBase64 = function(value) {
        value = value || '';
        var h = base64ToHex(value);
        var b = hexToBinary(h).result;
        this.data = [];
        for (var i = 0; i < this.size; i++) {
            this.data[i] = b.charAt(i) === '1';
        }
    };
    
    BitArray.prototype.toBase64UrlSafe = function() {
        return this.urlEncode(this.toBase64());
    };
    
    BitArray.prototype.fromBase64UrlSafe = function(value) {
        return this.fromBase64(this.urlDecode(value));
    };
    
    BitArray.prototype.urlEncode = function(value) {
        value = value || '';
        return value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    };
    
    BitArray.prototype.urlDecode = function(value) {
        value = value || '';
        var incoming = value.replace(/-/g, '+').replace(/_/g, '/');
        
        switch (value.length % 4) {
            case 2: incoming += "=="; break;
            case 3: incoming += "="; break;
        }
        return incoming;
    };
    
    return BitArray;
})();

module.exports = BitArray;