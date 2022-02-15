SELECT a.socialsecuritynumbervalue as ssn
FROM datagenerated_socialsecuritynumber as a
WHERE a.statusid=1
ORDER BY random()
LIMIT 1