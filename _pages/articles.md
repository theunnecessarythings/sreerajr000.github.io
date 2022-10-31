---
layout: default
title: Articles
permalink: /articles
---
<!-- Posts Index
================================================== -->
<section class="recent-posts">

    <div class="section-title">

        <h2><span>All Articles</span></h2>

    </div>

    <div class="row listrecent">

        {% for post in site.categories["Article"] %}

        {% include postbox.html %}

        {% endfor %}

    </div>

</section>
