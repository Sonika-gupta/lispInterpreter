(lambda (x) (+ x x))
((lambda (x) (+ x x)) 4)
(define reverse-subtract
	(lambda (x y) (- y x)))
(reverse-subtract 7 10)
#(define add4 (let x 4 (lambda (y) (+ x y))))
#(add4 6)