SELECT a.areacodevalue as areacode, b.phonenumbervalue as phonenumber
FROM dataexisting_areacode as a, datagenerated_phonenumber as b
WHERE a.statusid=1
ORDER BY random()
LIMIT 1