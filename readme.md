# JS SDK

The original format as defined in wiki is:
```
SCXD01AA:PP:OBJECTID:ENCRYPTEDDATA
```
however from the C++ it looks more like:
```
SCXD01:FLAGS:OBJECTID:ENCRYPTEDDATA
# which builds up like
SCXD01:1:0123456789abcdef:W3NvbWVCYXNlNjRFbmNyeXB0ZWREYXRhXQ==
```

here, it is missing `AA` from first part, and `1` (single letter) used for base64 encoding. I think it should always b two letters for consistency i.e. `01`