def check(n):
    for i in range(2,n):
        if(n%i==0):
            print("composite")
            break
    if(i==n-1):
        print("prime")
a=int(input("enter the number"))
check(a)                        