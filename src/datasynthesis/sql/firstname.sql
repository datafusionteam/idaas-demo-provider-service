SELECT a.gender, a.firstname
FROM dataexisting_namefirst as a
WHERE a.gender='F' OR a.gender='M'
ORDER BY random()
LIMIT 1;