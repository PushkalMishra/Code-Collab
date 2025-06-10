# def f1():
#     n=int(input("enter the n natural number"))
#     for i in range(1,n+1):
#         print(i**2)
# f1()

# def table(a):
#     for i in range(1,11):
#         print(a*i)
# n=int(input("entr the number"))
# table(n)        

# def greatest(a,b,c):
#     if(a>b and a>c):
#         print(a)
#     elif(b>a and b>c):
#         print(b)
#     else:
#         print(c)
# n=int(input("enter the number"))
# m=int(input("enter the number"))
# h=int(input("enter the number"))
# greatest(n,m,h)

def armstrong(a):
    s=0
    while(a!=0):
        r=a%10
        a=a//10
        s=s+r*r*r
    if(a==s):
        print("number is armstrong")
    else:
        print("number is nnot armstrong")
n=int(input("enter the number"))
armstrong(n)                
