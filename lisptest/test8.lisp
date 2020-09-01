(define fib (lambda (n) (if (< n 2) 1 (+ (fib (- n 1)) (fib (- n 2))))))
(define range (lambda (a b) (if (= a b) (quote ()) (cons a (range (+ a 1) b)))))
(range 0 10)
(map fib (range 0 10))
(map fib (range 0 20))

#Expected Output:
#(0 1 2 3 4 5 6 7 8 9)
#(1 1 2 3 5 8 13 21 34 55)
#(1 1 2 3 5 8 13 21 34 55 89 144 233 377 610 987 1597 2584 4181 6765)