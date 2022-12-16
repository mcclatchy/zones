current != awk '/version/{print $$2}' package.json | egrep -o "([0-9]{1,}\.?)+"
version != echo $(current) | awk '{ split($$0,v,"."); print v[1] "." v[2] "." int(v[3])+1 }'

default:
	@ echo "please specify a make rule"

release:
	@ sed -E -i 's/([0-9]+\.){2}([0-9]+)/$(version)/' package.json
	git add package.json
	git commit -m "updating package.json to $(version)"
	git push
	git tag $(version)
	git push origin $(version)

