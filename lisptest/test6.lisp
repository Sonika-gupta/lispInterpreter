(define first car)
(define rest cdr)
(define count (lambda (item L) (if L (+ (equal? item (first L)) (count item (rest L))) 0)))
(count 0 (list 0 1 2 3 0 0))
#3
(count (quote the) (quote (the more the merrier the bigger the better)))
#4