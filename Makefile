version = $(error Missing version number)
current = $(shell grep -Eo '([0-9]{1,}\.?){3}' package.json)

default:
	@ echo "please specify a make rule"

release:
	awk -v c="$(current)" -v n="$(version)" "{sub(c,n); print}" package.json > tmp.json
	mv tmp.json package.json
	git add package.json
	git commit -m "updating package.json to $(version)"
	git push
	git tag $(version)
	git push origin $(version)

