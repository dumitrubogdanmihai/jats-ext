<?xml version="1.0" encoding="UTF-8"?>
<sch:schema xmlns:sch="http://purl.oclc.org/dsdl/schematron"
    xmlns:sqf="http://www.schematron-quickfix.com/validator/process" queryBinding="xslt2"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <sch:pattern>

        <sch:title>ISSN Format </sch:title>
        <sch:rule context="issn | issn-l">
            <sch:assert
                test="
                    (string-length(./text()) = 9
                    and number(substring(./text(), 6))
                    and number(substring(./text(), 1, 4))
                    and contains(./text(), '-'))
                    or
                    (string-length(./text()) = 8
                    and number(./text()))
                    "
                > ISSN wrong format </sch:assert>
        </sch:rule>

        <sch:title>Iteme cresc </sch:title>
        <sch:rule context="ref/label[following::label]">
            <xsl:variable name="text" select="text() + 1"/>
            <sch:assert test="(./following::label[1]/text() = $text)"> Iteme cresc </sch:assert>
        </sch:rule>

        <sch:title>Every item list is unique </sch:title>
        <sch:rule context="ref/label[following::label]">
            <xsl:variable name="text" select="text()"/>
            <sch:assert test="not(./following::label[text() = $text])"> Every item is unique
            </sch:assert>
        </sch:rule>

        <sch:title>Title starts with a lower-case letter</sch:title>
        <sch:rule context="title | article-title">
            <sch:assert test="not(compare(upper-case(substring(., 1, 1)), substring(., 1, 1)))"
                sqf:fix="resolveBold"> This title starts with a lower-case letter: <value-of
                    select="title"/>
            </sch:assert>
            <sch:assert test="count(tokenize(./text(), ' ')) &lt; 15"> Longer title <xsl:value-of
                    select="title"/>
            </sch:assert>
            <sqf:fix id="resolveBold">
                <sqf:description>
                    <sqf:title>Change the bold element into text</sqf:title>
                    <sqf:p>Removes the bold (b) markup and keeps the text content.</sqf:p>
                </sqf:description>
                <xsl:variable name="text"
                    select="concat(upper-case(substring(text(), 1, 1)), substring(text(), 2))"/>
                <sqf:replace match="./text()" select="$text"/>
            </sqf:fix>
        </sch:rule>

        <sch:title>Every article must have contrib group </sch:title>
        <sch:rule context="//article">
            <sch:assert test="not(contrib-group)"> Every article must have contrib group <value-of
                    select="title"/>
            </sch:assert>
        </sch:rule>

        <sch:rule context="//*[@id]">
            <xsl:variable name="currentId" select="@id"/>
            <sch:assert test="count(//*[@id = $currentId]) = 1">Duplicate id definition.</sch:assert>
            <sch:assert test="//*[@rid = $currentId]">Reference not used.</sch:assert>
        </sch:rule>

        <!-- cand referintele nu sunt gasite -->
        <sch:rule context="//*[@rid]">
            <xsl:variable name="currentId" select="@rid"/>
            <sch:assert test="//*[@id = $currentId]">Reference not found.</sch:assert>
        </sch:rule>
    </sch:pattern>
</sch:schema>
