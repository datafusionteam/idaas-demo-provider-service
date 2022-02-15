SELECT a.addressstreet as street, a.addressstreet2 as street2
FROM datagenerated_addresses as a
WHERE a.statusid=1
ORDER BY random()
LIMIT 1