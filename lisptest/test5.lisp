(define circle-area (lambda (r) (* pi (* r r))))
(circle-area (3))
(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))
(fact 10)
(fact 100)
(circle-area (fact 10))
(pow 2 16)
#65536.0
