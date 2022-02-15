SELECT a.lastname
FROM dataexisting_namelast as a
WHERE a.statusid=1
ORDER BY random()
LIMIT 1