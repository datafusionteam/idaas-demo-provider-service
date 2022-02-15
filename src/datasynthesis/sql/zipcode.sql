SELECT a.zipcode, a.city, a.statecode
FROM dataexisting_zipcodeus as a
WHERE a.statusid=1
ORDER BY random()
LIMIT 1