all: election.html election.pdf

election.html: election.rst
	rst2html election.rst > election.html

election.tex: election.rst
	rst2xetex election.rst > election.tex

election.pdf: election.tex
	xelatex election
	xelatex election


clean:
	rm election.html

.PHONY: all clean
